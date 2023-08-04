import React, { useCallback, useEffect, useReducer } from "react";

import IngredientForm from "./IngredientForm";
import Search from "./Search";
import IngredientList from "./IngredientList";
import ErrorModal from "../UI/ErrorModal";

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

// http 요청에 대한 리듀서
const httpReducer = (currentHttpState, action) => {
  switch (action.type) {
    case "SEND":
      return { loading: true, error: null };

    case "RESPONSE":
      return { ...currentHttpState, loading: false };

    case "ERROR":
      return { loading: false, error: action.errorMessage };

    case "CLEAR":
      return { ...currentHttpState, error: null };
    //모달창 닫기> null은 거짓으로 취급됨

    default:
      throw new Error("여기로 오지 마세요!");
  }
};

const Ingredients = () => {
  const [userIngredients, dispatch] = useReducer(ingredientReducer, []);
  const [httpState, dispatchHttp] = useReducer(httpReducer, {
    loading: false,
    error: null,
  });

  //Ingredients 컴포넌트 렌더링 될 때 마다 모든 재료 목록 가져와야 하는데 이미 Search에서 가져와서 목록에 넣어주고 있기 때문에 두번 중복으로 가져올 필요 없음
  useEffect(() => {
    console.log("재료 목록 렌더링: ", userIngredients);
  }, [userIngredients]);

  //컴포넌트 첫 렌더링시 자녀인 Search 컴포넌트를 렌더링할 때 onLoadIngredients()도 호출하게 된다.
  //그러면 그 함수 안의 setUserIngredients()가 호출되어 state가 변경된다.
  //따라서 Ingredients 컴포넌트가 리렌더링된다.
  //그러면 또 다시 새로운 filteredIngredientsHandler() 객체 인스턴스가 생성되는데
  //새로 생성된 인스턴스가 새로운 참조값으로 onLoadIngredients 프롭에 전달되면
  //Search 컴포넌트의 useEffect에서 종속하는 onLoadIngredients 값이 달라졌다고 판단되므로 이펙트가 재실행된다.
  //이렇게 무한 루프에 빠져버린다.
  //이를 막기 위해 useCallback()을 사용하자.
  const filteredIngredientsHandler = useCallback((filteredIngredients) => {
    dispatch({
      type: "SET",
      ingredients: filteredIngredients,
    });
  }, []);
  //이렇게 하면 이 함수는 다시 실행되지 않고 리액트는 이 함수를 캐싱(cache)하여 리렌더링되어도 남아있게 한다.
  //따라서 Ingredients 컴포넌트가 리렌더링되어도 이 함수는 새로 생성되지 않아서 참조값이 바뀌지 않는다.
  // 따라서 Search 컴포넌트의 onLoadIngredients에 넘겨준 함수는 이전에 렌더링할 때 사용한 함수의 참조값과 같으므로 이펙트 함수도 재실행되지 않는다.

  const addIngredientHandler = async (newIngredient) => {
    dispatchHttp({ type: "SEND" });

    //서버 업데이트
    const response = await fetch(
      "https://react-http-35c4a-default-rtdb.firebaseio.com/ingredients.json",
      {
        method: "POST",
        body: JSON.stringify(newIngredient),
        headers: {
          "Content-Type": "application/json",
        }, //자바스크립트 객체나 중첩 자바스크립트 객체로 변환- firebase는 "Content-Type" 헤더 필요
      } //firebase가 자동으로 id 생성해주기 때문에 id 빼고 보내기
    );

    const resData = await response.json();

    dispatchHttp({ type: "RESPONSE" });

    //서버에 업데이트 요청 완료되면 로컬도 업데이트
    dispatch({
      type: "ADD",
      ingredient: {
        id: resData.name,
        ...newIngredient,
      },
    });
  };

  // 재료 삭제
  const removeIngredientHandler = async (ingredientId) => {
    dispatchHttp({ type: "SEND" });

    try {
      // 서버에 삭제
      await fetch(
        `https://react-http-35c4a-default-rtdb.firebaseio.com/ingredients/${ingredientId}.json`,
        // 노드 순서: ingredients/재료id
        // 삭제할 노드 지정하여 삭제 요청 보내기
        {
          method: "DELETE",
        }
      );
      dispatchHttp({ type: "RESPONSE" });
      // 삭제하는 거라서 어떤 응답오는지는 중요하지 않고 화면에 재료 목록 업데이트하는게 중요
      // 로컬에서 삭제
      dispatch({
        type: "DELETE",
        id: ingredientId,
      });

      //fetch는 Promise 반환하므로 catch()로 에러 캐치
    } catch (error) {
      dispatchHttp({ type: "ERROR", errorMessage: "Something went wrong" });
    }
  };

  const clearError = () => {
    dispatchHttp({ type: "CLEAR" });
  };

  return (
    <div className="App">
      {httpState.error && (
        <ErrorModal onClose={clearError}>{httpState.error}</ErrorModal>
      )}
      <IngredientForm
        onAddIngredient={addIngredientHandler}
        loading={httpState.loading}
      />
      <section>
        <Search onLoadIngredients={filteredIngredientsHandler} />
        <IngredientList
          ingredients={userIngredients}
          onRemoveItem={removeIngredientHandler}
        />
      </section>
    </div>
  );
};

export default Ingredients;
