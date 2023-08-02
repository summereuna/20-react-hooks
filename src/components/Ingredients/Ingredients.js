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
    case "SEND": //http 요청 전송 직전에 동작할 내용
      // 리듀서가 알아서 요청까지 보내는건 아니다. 그건 밑에 코드에서 ㅇㅇ..
      //여기서는 요청 전송과 관련있고 UI에 영향주는 상태들에 대한 상태만 관리하면 된다.
      //즉 이 state에 의해 로딩인디케이터나 에러창 표시할 건지 결정할 수 있도록 하면 된다.
      return { loading: true, error: null };

    case "RESPONSE": // http 요청 응답 도착 시 동작할 내용
      return { ...currentHttpState, loading: false };
    //일반적으로 프로퍼티에 원하는 값 넣기 전에 원래 있던 state 값을 가져온 후, 전개연산자 사용해 키-값 쌍을 꺼내고 꺼낸 값을 새로 만든 객체에 합쳐준다.
    //그래야 기존 state에서 누락되는 값이 없다 ㅇㅇ!
    // loading: false 로 기존 loading 프로퍼티를 덮어 씌워주는 거다.
    //새로 만들어지는 객체는 새로운 state로 반환된다.

    case "ERROR": // http 요청 오류 발생 시 동작할 내용
      return { loading: false, error: action.errorMessage };

    case "CLEAR": // 에러 모달 닫을 때 동작할 내용
      return { ...currentHttpState, error: null };

    default:
      throw new Error("여기로 오지 마세요!");
  }
};

const Ingredients = () => {
  const [userIngredients, dispatch] = useReducer(ingredientReducer, []);
  const [httpState, dispatchHttp] = useReducer(httpReducer, {
    //초기 값으로 객체 보내자.
    loading: false,
    error: null,
  });

  // const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState();

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
    //setUserIngredients(filteredIngredients);
    dispatch({
      type: "SET",
      ingredients: filteredIngredients,
    });
    //useReducer()를 사용하면, 리듀서가 새로운 상태를 반환할 때마다 리액트는 컴포넌트를 리렌더링한다.
  }, []);

  //이렇게 하면 이 함수는 다시 실행되지 않고 리액트는 이 함수를 캐싱(cache)하여 리렌더링되어도 남아있게 한다.
  //따라서 Ingredients 컴포넌트가 리렌더링되어도 이 함수는 새로 생성되지 않아서 참조값이 바뀌지 않는다.
  // 따라서 Search 컴포넌트의 onLoadIngredients에 넘겨준 함수는 이전에 렌더링할 때 사용한 함수의 참조값과 같으므로 이펙트 함수도 재실행되지 않는다.

  const addIngredientHandler = async (newIngredient) => {
    // setIsLoading(true);
    dispatchHttp({ type: "SEND" });
    //서버: firebase
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

    //응답 받으면 state 업데이트
    // setIsLoading(false);
    dispatchHttp({ type: "RESPONSE" });

    //서버에 업데이트 요청 완료!되면 로컬도 업데이트하기
    // setUserIngredients((prev) => [
    //   ...prev,
    //   {
    //     id: resData.name,
    //     ...newIngredient,
    //   },
    // ]);

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
    // setIsLoading(true);
    dispatchHttp({ type: "SEND" });

    try {
      // 서버에서 삭제하는 기능
      await fetch(
        `https://react-http-35c4a-default-rtdb.firebaseio.com/ingredients/${ingredientId}.json`,
        // 노드 순서: ingredients/재료id
        // 삭제할 노드 지정하여 삭제 요청 보내기
        {
          method: "DELETE",
        }
      );
      //응답 받으면 isLoading 끄기 =>  리렌더링
      // setIsLoading(false);
      dispatchHttp({ type: "RESPONSE" });

      // 삭제하는 거라서 어떤 응답오는지는 중요하지 않고 화면에 재료 목록 업데이트하는게 중요

      // 로컬에서 삭제하는 기능
      // setUserIngredients((prevIngredients) =>
      //   prevIngredients.filter((ingredient) => ingredient.id !== ingredientId)
      // );
      dispatch({
        type: "DELETE",
        id: ingredientId,
      });

      //fetch는 Promise 반환하므로 catch()로 에러 잡을 수 있다.
    } catch (error) {
      dispatchHttp({ type: "ERROR", errorMessage: "Something went wrong" });
      // setError("Something went wrong!");
      // setIsLoading(false);
      // 동일한 시점에 같은 함수 안에서 요청한 모든 상태 업데이트는 일괄 처리 된다(batch)
      //setError로 렌더링 한번 되고 setIsLoading로 렌더링 한 번 더 되는 것이 아니라
      //렌더링 한번 일어난단 소리임 ㅇㅇ
    }
  };

  const clearError = () => {
    // setError(null);
    //모달창 닫기> null은 거짓으로 취급됨
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
