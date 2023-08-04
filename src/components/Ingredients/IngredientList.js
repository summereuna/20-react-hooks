import React from "react";

import "./IngredientList.css";

const IngredientList = React.memo((props) => {
  console.log("IngredientList: 얘는 몇번이나 재렌더링 되나 보자");
  return (
    <section className="ingredient-list">
      <h2>Loaded Ingredients</h2>
      <ul>
        {props.ingredients.map((ig) => (
          <li
            key={ig.id}
            id={ig.id}
            onClick={props.onRemoveItem.bind(this, ig.id)}
          >
            <span>{ig.title}</span>
            <span>{ig.amount}x</span>
          </li>
        ))}
      </ul>
    </section>
  );
});

export default IngredientList;
