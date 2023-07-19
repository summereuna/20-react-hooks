import React, { useState } from "react";

import IngredientForm from "./IngredientForm";
import Search from "./Search";
import IngredientList from "./IngredientList";

const Ingredients = () => {
  //여기서 Form에서 인풋 받아서 리스트로 출력함
  //여기서 재료를 관리한다는건 useState()를 사용해야 한다는 뜻
  const [userIngredients, setUserIngredients] = useState([]);
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
        <Search />
        <IngredientList
          ingredients={userIngredients}
          onRemoveItem={removeIngredientHandler}
        />
      </section>
    </div>
  );
};

export default Ingredients;
