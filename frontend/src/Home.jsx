import React from "react";

function Home({userInfo, isLogged}) {
  return (<div>
    {isLogged ? ( <h1>Welcome back {userInfo.username}!  </h1>): <h1>Welcome to EyeHR!</h1>}
    </div>
)
}

export default Home;
