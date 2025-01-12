import Form from "../Component/Form";


export function Login() {

  return (
    <Form route="dj-rest-auth/login/" method='login' />
  );
}

export default Login;
