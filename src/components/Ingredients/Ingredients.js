import React, { useEffect, useState } from "react";

import IngredientForm from "./IngredientForm";
import Search from "./Search";
import IngredientList from "./IngredientList";

const Ingredients = () => {
  //여기서 Form에서 인풋 받아서 리스트로 출력함
  //여기서 재료를 관리한다는건 useState()를 사용해야 한다는 뜻
  const [userIngredients, setUserIngredients] = useState([]);

  //Ingredients 컴포넌트 렌더링 될 때 마다 모든 재료 목록 가져와야 함
  //컴포넌트가 마운트 될 때 데이터 가져오기
  //useEffect() 사용
  useEffect(() => {
    //Ingredients 컴포넌트가 렌더링된 이후 실행
    // 그리고 Ingredients 컴포넌트가 렌더링 될 때 마다 실행되는 함수
    const fetchData = async () => {
      const response = await fetch(
        "https://react-http-35c4a-default-rtdb.firebaseio.com/ingredients.json"
      );

      const resData = await response.json();
      const loadedIngredients = [];
      for (const key in resData) {
        //loadedIngredients는 상수이지만, push()sms loadedIngredients에 저장된 값을 변경하는게 아닌 메모리에 있는 배열을 변경하는 거기 때문에 사용 가능
        //세로운 객체 빈 배열인 loadedIngredients에 넣기
        loadedIngredients.push({
          id: key,
          title: resData[key].title,
          amount: resData[key].amount,
        });
      }

      setUserIngredients(loadedIngredients);
    };

    fetchData();
  }, []);

  // useEffect(() => {
  //   console.log("재료 목록 렌더링: ", userIngredients);
  // }, [userIngredients]);

  const filteredIngredientsHandler = (filteredIngredients) => {
    setUserIngredients(filteredIngredients);
  };

  const addIngredientHandler = async (newIngredient) => {
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
    //서버에 업데이트 요청 완료!되면 로컬도 업데이트하기
    setUserIngredients((prev) => [
      ...prev,
      {
        id: resData.name,
        ...newIngredient,
      },
    ]);
  };

  const removeIngredientHandler = (ingredientId) => {
    setUserIngredients((prevIngredients) =>
      prevIngredients.filter((ingredient) => ingredient.id !== ingredientId)
    );
  };

  return (
    <div className="App">
      <IngredientForm onAddIngredient={addIngredientHandler} />
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
