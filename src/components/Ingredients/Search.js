import React, { useEffect, useState } from "react";

import Card from "../UI/Card";
import "./Search.css";

const Search = React.memo((props) => {
  //props 구조분해 할당해서 사용
  const { onLoadIngredients } = props;

  const [enteredFilter, setEnteredFilter] = useState("");

  const filterHandler = (event) => {
    setEnteredFilter(event.target.value);
  };

  //http 요청 보내기
  useEffect(() => {
    //사용자가 뭔가 입력할 때 필터링한 데이터를 firebase에서 가져오기
    //filterHandler 함수로 키 입력이 들어올 때 마다 http 요청 보내면 됨
    //현재 키 입력이 들어올 때 마다 state 업데이트 하는데, 그 대신 useEffect 사용하여
    //이펙트 함수 안에서 호출하여 인수로 넣는 함수에서 http 요청 보내기

    const fetchData = async () => {
      //파이어베이스 데이터 필터링
      // enteredFilter에 입력된 값이 있으면, title이 enteredFilter와 같은 값 가져와라
      const query =
        enteredFilter.length === 0
          ? ""
          : `?orderBy="title&equalTo="${enteredFilter}"`;

      const response = await fetch(
        `https://react-http-35c4a-default-rtdb.firebaseio.com/ingredients.json${query}`
      );

      const resData = await response.json();
      const loadedIngredients = [];
      for (const key in resData) {
        //loadedIngredients는 상수이지만, push()는 loadedIngredients에 저장된 값을 변경하는게 아닌 메모리에 있는 배열을 변경하는 거기 때문에 사용 가능
        //세로운 객체 빈 배열인 loadedIngredients에 넣기
        loadedIngredients.push({
          id: key,
          title: resData[key].title,
          amount: resData[key].amount,
        });
      }

      // 데이터 가져오고 나서 검색결과만 보여줘야 하니까 Ingredients 컴포넌트 리스트 거기에 맞게 바꿔줘야함
      onLoadIngredients(loadedIngredients);
    };

    fetchData();
  }, [enteredFilter, onLoadIngredients]); //props.onLoadIngredients 구조분해할당해서 사용해야 의존성에 모든 props가 아닌 onLoadIngredients만 넣억서 원하는 바 대로 작동할 수 있음

  return (
    <section className="search">
      <Card>
        <div className="search-input">
          <label>Filter by Title</label>
          <input type="text" value={enteredFilter} onChange={filterHandler} />
        </div>
      </Card>
    </section>
  );
});

export default Search;
