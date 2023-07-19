import React, { useState } from "react";

import IngredientForm from "./IngredientForm";
import Search from "./Search";
import IngredientList from "./IngredientList";

const Ingredients = () => {
  //여기서 Form에서 인풋 받아서 리스트로 출력함
  //여기서 재료를 관리한다는건 useState()를 사용해야 한다는 뜻
  const [userIngredients, setUserIngredients] = useState([]);
  const addIngredientHandler = (newIngredient) => {
    setUserIngredients((prev) => [
      ...prev,
      {
        ...newIngredient,
        id: Math.random().toString(),
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
