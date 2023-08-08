import { useCallback, useReducer } from "react";

const initialState = {
  loading: false,
  error: null,
  data: null, //초기 값은 없으니 null
  extra: null, // id 설정 위해 추가
  identifier: null, // 타입 식별 위해 추가
};

//✅ 훅 바깥에 httpReducer 옮겨서 정의하기
//🌟 리듀서는 리렌더링될 때 마다 다시 실행할 필요가 없기 때문에 바깥에 정의하면 된다.
// http 요청에 대한 리듀서
const httpReducer = (currentHttpState, action) => {
  switch (action.type) {
    case "SEND":
      return {
        loading: true,
        error: null,
        data: null,
        extra: null,
        identifier: action.reqIdentifier,
      }; // 새 요청 보낼 때 data는 무조건 null로 재설정
    //요청 전송 시 extra 초기화되도록 null

    case "RESPONSE":
      return {
        ...currentHttpState,
        loading: false,
        data: action.responseData,
        extra: action.extra, //응답 받으면 extra 값 넣기
      };

    case "ERROR":
      return { loading: false, error: action.errorMessage };

    case "CLEAR":
      return initialState;
    // return { ...currentHttpState, error: null };
    //모달창 닫기> null은 거짓으로 취급됨

    default:
      throw new Error("여기로 오지 마세요!");
  }
};

const useHttp = () => {
  //✅ useReducer 호출하여 httpReducer 사용
  const [httpState, dispatchHttp] = useReducer(httpReducer, initialState);
  // 🔥state 컴포넌트에 연결시키기 위해 커스텀 훅에서 배열을 반환하자.

  const clear = useCallback(() => {
    dispatchHttp({ type: "CLEAR" });
  }, []);

  //✅ remove핸들러에서 http 요청과 관련된 블록 가져와서 요청 보내는 함수 만들기
  //플렉서블 하게 데이터를 받아서 sendRequest()가 요청을 보낼 수 있도록 하자 > 다이나믹 데이터
  //고정된 url, method, body 사용하지 않도록 밖에서 보낼 수 있게 하기
  const sendRequest = useCallback(
    (url, method, body, reqExtra, reqIdentifier) => {
      const fetchData = async () => {
        //불필요한 리렌더링 막기 위해 useCallback으로 감싸기
        dispatchHttp({ type: "SEND", identifier: reqIdentifier }); //stateful(state를 이용하는) 부분: 여기서 리듀서와 상호작용함
        console.log(reqIdentifier);
        try {
          // 서버에 삭제
          const response = await fetch(url, {
            method,
            body,
            headers: { "Content-Type": "application/json" },
          });

          const resData = await response.json();

          //훅은 http 요청만 신경쓰면 된다. 이 요청을 어떻게 관리할지만 생각하면 된다.
          //응답 받아서 어떻게 처리할 지는 컴포넌트의 핸들러들이 알아서 할 일이므로 데이터를 컴포넌트에게 돌려주자.
          //🔥응답 받은 데이터를 요청을 만든 컴포넌트에게 돌려주기 위해 httpState에 새로운 상태, data를 추가하자.

          //🔥응답 데이터 state에 저장
          dispatchHttp({
            type: "RESPONSE",
            responseData: resData,
            extra: reqExtra,
          });

          //fetch는 Promise 반환하므로 catch()로 에러 캐치
        } catch (error) {
          dispatchHttp({ type: "ERROR", errorMessage: "Something went wrong" });
        }
      };

      fetchData();
    },
    []
  );

  //state들 컴포넌트에 연결할 수 있도록 커스텀 훅 함수의 끝에서 객체 반환하기 / 배열이나 숫자 등도 반환 가능
  return {
    isLoading: httpState.loading,
    error: httpState.error,
    data: httpState.data,
    reqExtra: httpState.extra,
    reqIdentifier: httpReducer.identifier,
    sendRequest,
    clear,
  };

  //useHttp가 직접 요청을 보내는 것이 아니다. 단지 요청을 보내기 위한 로직을 구성하고, state를 구성하고 함수(sendRequest)를 구성한다.
  //요청을 보내는 건 sendRequest 함수이다.
  // 요청 보내는 함수도 반환해서 컴포넌트에서 사용할 수 있게하자.
};

export default useHttp;

// const sendRequest = useCallback(async function (
//   url,
//   method,
//   body,
//   reqExtra,
//   reqIdentifier
// ) {
//   //불필요한 리렌더링 막기 위해 useCallback으로 감싸기
//   dispatchHttp({ type: "SEND", identifier: reqIdentifier }); //stateful(state를 이용하는) 부분: 여기서 리듀서와 상호작용함

//   try {
//     // 서버에 요청
//     const response = await fetch(url, {
//       method: method,
//       body: body,
//       headers: { "Content-Type": "application/json" },
//     });

//     const resData = await response.json();

//     //훅은 http 요청만 신경쓰면 된다. 이 요청을 어떻게 관리할지만 생각하면 된다.
//     //응답 받아서 어떻게 처리할 지는 컴포넌트의 핸들러들이 알아서 할 일이므로 데이터를 컴포넌트에게 돌려주자.
//     //🔥응답 받은 데이터를 요청을 만든 컴포넌트에게 돌려주기 위해 httpState에 새로운 상태, data를 추가하자.

//     //🔥응답 데이터 state에 저장
//     dispatchHttp({
//       type: "RESPONSE",
//       responseData: resData,
//       extra: reqExtra,
//     });

//     //fetch는 Promise 반환하므로 catch()로 에러 캐치
//   } catch (error) {
//     dispatchHttp({
//       type: "ERROR",
//       errorMessage: "Something went wrong",
//     });
//   }
// },
// []);
