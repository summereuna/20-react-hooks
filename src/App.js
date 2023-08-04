import React, { useContext } from "react";

import Ingredients from "./components/Ingredients/Ingredients";
import Auth from "./components/Auth";
import { AuthContext } from "./context/auth-context";

//로그인 한 경우에만 재료 목록 반환하기
const App = (props) => {
  const authContext = useContext(AuthContext);

  let content = <Auth />;
  if (authContext.isAuth) {
    content = <Ingredients />;
  }

  return content;
};

export default App;

// App.js에는 프로바이더가 아닌 AuthContext 객체 자체를 가져온다.
//함수형 컴포넌트에서 컨텍스트를 사용하려면 useContext()훅을 사용한다.
// useContext()에 AuthContext객체를 인수로 보내 변수를 생성하여 사용하면 된다.
//authContext.isAuth를 구독(확인)하면,  App은 컨텍스트 값이 변경될 때마다 재구성된ㄴ다.
