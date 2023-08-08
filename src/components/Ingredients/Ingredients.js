import React, { useCallback, useEffect, useMemo, useReducer } from "react";

import IngredientForm from "./IngredientForm";
import Search from "./Search";
import IngredientList from "./IngredientList";
import ErrorModal from "../UI/ErrorModal";
import useHttp from "../../hooks/http";

//커스텀 훅은 다른 훅들과 마찬가지로 루트레벨에서만 사용할 수 있다.
//리무브핸들러 같은 함수 안에서 사용할 수 없다.

const ingredientReducer = (currentIngredients, action) => {
  switch (action.type) {
    case "SET":
      return action.ingredients;
    case "ADD":
      return [...currentIngredients, action.ingredient];
    case "DELETE":
      return currentIngredients.filter(
        (ingredient) => ingredient.id !== action.id
      );
    default: // 디폴트 케이스는 없어야 하기 때문에 오류 발생시키자.
      throw new Error("여기로 오지 마세요!");
  }
};

const Ingredients = () => {
  const [userIngredients, dispatch] = useReducer(ingredientReducer, []);

  // useHttp 호출하여 리턴한 객체 반환
  //구조분해할당으로 훅에서 내보낸 "객체{}"에서 프로퍼티 별로 상수에 저장한 값 꺼내오기
  const {
    isLoading,
    error,
    data,
    reqExtra,
    reqIdentifier,
    sendRequest,
    clear,
  } = useHttp();
  //- reqExtra
  //sendRequest()함수 호출하야ㅕ extra 값 전달하면 useHttp훅의 SEND 디스패치가 실행되는데 이때 extra 값이 state에 업데이트 된다.
  //따라서 useHttp 를 호출할 때 extra를 사용할 수 있게 된다.

  //- data
  //- useEffect는 렌더링이 끝날 때 마다 실행된다.
  //sendRequest가 요청을 보내고 요청에 대한 응답 받으면 RESPONSE 액션 디스패치된다.
  //그러면 state가 업데이트 되고 이로 인해 useHttp 훅을 사용하는 컴포넌트들은 자체적으로 재구성된다.
  //따라서 SEND 요청이 완료되면 ingredients 컴포넌트는 자체적으로 다시 구성된다.
  //- 의존성 배열에 data 추가해서 useEffect() 좀 더 쓸모있게 바꾸자.
  //data는 우리가 만든 요청에 있는 필드고, 응답이 오면 그 값을 응답 데이터(responseData)로 업데이트한다.
  //Ingredients.js 에서 data를 보는 이유는 useEffect() 함수 안에서 새로운 데이터를 받았을 때, ingredientReducer를 통해 받은 dispatch 함수를 호출하기 위함이다.
  //- 요청이 처리되고 응답이 오면 반환값에서 data가 추출된다.
  //그럼 아래 Effect가 실행되고, 딜레트 액션이 디스패치되서 재료 목록이 업데이트 된다.

  //응답 처리는 useEffect 안에서
  // useEffect(() => {
  //   console.log("그림 그려라라라");
  //   //newIngredient 값이 있으면 추가 요청 / 없으면 삭제 요청
  //   if (!isLoading && !error && reqIdentifier === "REMOVE_INGREDIENT") {
  //     dispatch({
  //       type: "DELETE",
  //       id: reqExtra,
  //     });
  //   } else if (!isLoading && !error && reqIdentifier === "ADD_INGREDIENT") {
  //     dispatch({
  //       type: "ADD",
  //       ingredient: {
  //         id: data.name, //서버에서 응답받은 data
  //         ...reqExtra,
  //       },
  //     });
  //   }
  // }, [isLoading, error, reqIdentifier, data, reqExtra]);
  //Ingredients 컴포넌트 렌더링 될 때 마다 모든 재료 목록 가져와야 하는데 이미 Search에서 가져와서 목록에 넣어주고 있기 때문에 두번 중복으로 가져올 필요 없음

  useEffect(() => {
    if (data) {
      dispatch({
        type: "ADD",
        ingredient: {
          id: data.name, //서버에서 응답받은 data
          ...reqExtra,
        },
      });
    }
  }, [data, reqExtra]);

  const filteredIngredientsHandler = useCallback((filteredIngredients) => {
    dispatch({
      type: "SET",
      ingredients: filteredIngredients,
    });
  }, []);

  const addIngredientHandler = useCallback(
    (newIngredient) => {
      //서버 업데이트
      sendRequest(
        "https://react-http-35c4a-default-rtdb.firebaseio.com/ingredients.json",
        "POST",
        JSON.stringify(newIngredient), // 추가할 재료 id 없는 상태로 받음,
        newIngredient, // 추가할 새로운 재료
        "ADD_INGREDIENT" //식별자
      );
    },
    [sendRequest]
  );

  // 요청은 핸들러에서
  // 재료 삭제
  const removeIngredientHandler = useCallback(
    (ingredientId) => {
      //// 노드 순서: ingredients/재료id
      // 삭제할 노드 지정하여 삭제 요청 보내기

      sendRequest(
        `https://react-http-35c4a-default-rtdb.firebaseio.com/ingredients/${ingredientId}.json`,
        "DELETE",
        null, // DELETE 메서드는 body가 필요 없음
        ingredientId, //reqExtra에 id 값 전달하여  dispatchHttp({ type: "SEND", extra: reqExtra }); 로 extra state에 id 저장하기
        "REMOVE_INGREDIENT" //식별자
      );

      dispatch({
        type: "DELETE",
        id: ingredientId,
      });
      //fetch()는 항상 프로미스를 반환하기 때문에 fetch()가 쓰인 sendRequest() 함수도 프로미스를 반환한다.
      //따라서 then/catch 블록을 추가하여 이 핸들러 안에서 응답을 처리할 수도 있다.

      //그 방법도 좋지만 응답을 useEffect에서 처리해 보자. 이는 역할을 분리하여 최대한 간결한 코드를 사용할 수 있기 때문에 훅의 기능을 최대한으로 살리는 방법이다.
    },
    [sendRequest]
  );

  const clearError = () => {
    clear();
  };

  //useMemo()를 호출하고 함수를 인수로 넘긴다.
  // 인수로 넘겨지는 함수는 우리가 저장하는 값이 아니라 리액트가 나중에 실행할 함수이다.
  // 이 함수가 반환하는 값이 우리가 저장할 값으로, 여기서는 IngredientList 컴포넌트를 반환하면 된다.
  const ingredientList = useMemo(() => {
    return (
      <IngredientList
        ingredients={userIngredients}
        onRemoveItem={removeIngredientHandler}
      />
    );
  }, [userIngredients, removeIngredientHandler]);
  // userIngredients, removeIngredientHandler 가 바뀔경우 리액트는 ingredientList 함수를 실행하여 저장할 새로운 객체를 만든다.
  // 그러고 나서 새로운 값으로 IngredientList 컴포넌트가 재구성되어 반환된다.

  return (
    <div className="App">
      {error && <ErrorModal onClose={clearError}>{error}</ErrorModal>}
      <IngredientForm
        onAddIngredient={addIngredientHandler}
        loading={isLoading}
      />
      <section>
        <Search onLoadIngredients={filteredIngredientsHandler} />
        {ingredientList}
      </section>
    </div>
  );
};

export default Ingredients;
