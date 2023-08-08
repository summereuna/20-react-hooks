import React, { useEffect, useRef, useState } from "react";

import Card from "../UI/Card";
import "./Search.css";
import useHttp from "../../hooks/http";
import ErrorModal from "../UI/ErrorModal";

const Search = React.memo((props) => {
  //props 구조분해 할당해서 사용
  const { onLoadIngredients } = props;
  const [enteredFilter, setEnteredFilter] = useState("");
  const inputRef = useRef();

  const filterHandler = (event) => {
    setEnteredFilter(event.target.value);
  };

  //http 요청 보내기
  const { isLoading, error, data: resData, sendRequest, clear } = useHttp();

  useEffect(() => {
    //사용자가 뭔가 입력할 때 필터링한 데이터를 firebase에서 가져오기
    //filterHandler 함수로 키 입력이 들어올 때 마다 http 요청 보내면 됨
    //현재 키 입력이 들어올 때 마다 state 업데이트 하는데, 그 대신 useEffect 사용하여
    //이펙트 함수 안에서 호출하여 인수로 넣는 함수에서 http 요청 보내기

    const timer = setTimeout(() => {
      if (enteredFilter === inputRef.current.value) {
        //파이어베이스 데이터 필터링
        // enteredFilter에 입력된 값이 있으면, title이 enteredFilter와 같은 값 가져와라
        const query =
          enteredFilter.length === 0
            ? ""
            : `?orderBy="title"&equalTo="${enteredFilter}"`; //오타수정

        //요청
        sendRequest(
          `https://react-http-35c4a-default-rtdb.firebaseio.com/ingredients.json${query}`,
          "GET"
        );
      }
    }, 500);

    //클린업 펑션은 동일한 useEffect()가 실행되기 직전 실행된다.
    //clearTimeout()에 timer를 인수로 보내어 지나간 타이머를 제거할 수 있다.
    return () => {
      clearTimeout(timer);
    };
  }, [enteredFilter, inputRef, sendRequest]); //props.onLoadIngredients 구조분해할당해서 사용해야 의존성에 모든 props가 아닌 onLoadIngredients만 넣억서 원하는 바 대로 작동할 수 있음

  //응답 처리
  useEffect(() => {
    if (!isLoading && !error && resData) {
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
    }
  }, [resData, isLoading, error, onLoadIngredients]);

  return (
    <section className="search">
      {error && <ErrorModal onClose={clear}>{error}</ErrorModal>}
      <Card>
        <div className="search-input">
          <label>Filter by Title</label>
          {isLoading && <span>Loading...</span>}
          <input
            ref={inputRef}
            type="text"
            value={enteredFilter}
            onChange={filterHandler}
          />
        </div>
      </Card>
    </section>
  );
});

export default Search;
