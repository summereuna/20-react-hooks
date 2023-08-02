import React, { useCallback, useEffect, useState } from "react";

import IngredientForm from "./IngredientForm";
import Search from "./Search";
import IngredientList from "./IngredientList";
import ErrorModal from "../UI/ErrorModal";

const Ingredients = () => {
  //여기서 Form에서 인풋 받아서 리스트로 출력함
  //여기서 재료를 관리한다는건 useState()를 사용해야 한다는 뜻
  const [userIngredients, setUserIngredients] = useState([]);

  //로딩 스피너 화면에 표시하기
  const [isLoading, setIsLoading] = useState(false);

  //에러 핸들링
  const [error, setError] = useState();

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
    setUserIngredients(filteredIngredients);
  }, []);

  //이렇게 하면 이 함수는 다시 실행되지 않고 리액트는 이 함수를 캐싱(cache)하여 리렌더링되어도 남아있게 한다.
  //따라서 Ingredients 컴포넌트가 리렌더링되어도 이 함수는 새로 생성되지 않아서 참조값이 바뀌지 않는다.
  // 따라서 Search 컴포넌트의 onLoadIngredients에 넘겨준 함수는 이전에 렌더링할 때 사용한 함수의 참조값과 같으므로 이펙트 함수도 재실행되지 않는다.

  const addIngredientHandler = async (newIngredient) => {
    setIsLoading(true);
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

    //응답 받으면 state 업데이트 =>  컴포넌트 리렌더링됨
    setIsLoading(false);

    //서버에 업데이트 요청 완료!되면 로컬도 업데이트하기
    setUserIngredients((prev) => [
      ...prev,
      {
        id: resData.name,
        ...newIngredient,
      },
    ]);
  };

  // 재료 삭제
  const removeIngredientHandler = async (ingredientId) => {
    setIsLoading(true);
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
      setIsLoading(false);
      // 삭제하는 거라서 어떤 응답오는지는 중요하지 않고 화면에 재료 목록 업데이트하는게 중요
      // 로컬에서 삭제하는 기능
      setUserIngredients((prevIngredients) =>
        prevIngredients.filter((ingredient) => ingredient.id !== ingredientId)
      );

      //fetch는 Promise 반환하므로 catch()로 에러 잡을 수 있다.
    } catch (error) {
      setError("Something went wrong!");
      setIsLoading(false);
      // 동일한 시점에 같은 함수 안에서 요청한 모든 상태 업데이트는 일괄 처리 된다(batch)
      //setError로 렌더링 한번 되고 setIsLoading로 렌더링 한 번 더 되는 것이 아니라
      //렌더링 한번 일어난단 소리임 ㅇㅇ
    }
  };

  const clearError = () => {
    setError(null); //모달창 닫기> null은 거짓으로 취급됨
  };

  return (
    <div className="App">
      {error && <ErrorModal onClose={clearError}>{error}</ErrorModal>}
      <IngredientForm
        onAddIngredient={addIngredientHandler}
        loading={isLoading}
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
