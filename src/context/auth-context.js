import { createContext, useState } from "react";

//✅ 컨텍스트 갹체 ✅ AuthContext 생성하여 기본 값 설정
export const AuthContext = createContext({
  isAuth: false,
  login: () => {},
});

//✅ 컴포넌트 ✅ 생성하여 리액트 컴포넌트 반환
//위에서 설정한 컨텍스트에 .Provider 붙이면 리액트 컴포넌트 얻을 수 있음
const AuthContextProvider = (props) => {
  //사용자 로그인 상태 관리
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const loginHandler = () => {
    setIsAuthenticated(true);
  };

  //AuthContext.Provider는 value 값을 받는데 위에서 컨텍스트 생성하여 기본 값으로 설정한 객체 모양을 받는다.
  return (
    <AuthContext.Provider
      value={{ isAuth: isAuthenticated, login: loginHandler }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;
