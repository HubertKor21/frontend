import Form from "../Component/Form";

export function Register() {

  return (
    <Form route='dj-rest-auth/registration/' method="register"/>
    );
  }

export default Register;