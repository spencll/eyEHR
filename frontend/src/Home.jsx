import React from "react";

function Home({users}) {
  return (<div>
    {users ? ( <h1>Welcome back {users[0].username}! </h1>): <h1>Welcome to Jobly!</h1>}
    </div>
)
}

export default Home;
