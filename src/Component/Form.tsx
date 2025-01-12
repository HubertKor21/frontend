import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { ACCESS_TOKEN } from "../constants";
import background from "../assets/images/blue-blank.jpg";
import { toast, ToastContainer } from "react-toastify";

interface FormProps {
  route: string;
  method: "login" | "register";
}

function Form({ route, method }: FormProps) {
  const [email, setEmail] = useState("");
  const [password1, setPassword1] = useState(""); // For registration
  const [password2, setPassword2] = useState(""); // For registration
  const [password, setPassword] = useState(""); // For login
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const title = method === "login" ? "Login now!" : "Register now!";
  const buttonText = method === "login" ? "Login" : "Register";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare data based on method
      const data =
        method === "login"
          ? { email, password } // For login
          : { email, password1, password2: password2 || undefined }; // For registration

      const res = await api.post(route, data);
      if (method === "login") {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        navigate("/");
      } else {
        navigate("/login");
      }
    } catch (error) {
      toast.error("Incorrect login details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <ToastContainer />
      {/* Left side - Login form */}
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="w-full max-w-sm p-6">
          <h1 className="text-5xl font-bold text-center mb-6">{title}</h1>
          <p className="text-center mb-6">
            Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda
            excepturi exercitationem quasi. In deleniti eaque aut repudiandae et
            a id nisi.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                placeholder="email"
                className="input input-bordered bg-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {method === "register" && (
              <>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Password</span>
                  </label>
                  <input
                    type="password"
                    placeholder="password"
                    className="input input-bordered bg-white"
                    value={password1}
                    onChange={(e) => setPassword1(e.target.value)}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Confirm Password (optional)</span>
                  </label>
                  <input
                    type="password"
                    placeholder="confirm password"
                    className="input input-bordered bg-white"
                    value={password2}
                    onChange={(e) => setPassword2(e.target.value)}
                  />
                </div>
              </>
            )}

            {method === "login" && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Password</span>
                </label>
                <input
                  type="password"
                  placeholder="password"
                  className="input input-bordered bg-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <label className="label">
                  <a
                    onClick={() => navigate("/register")}
                    className="label-text-alt link link-hover"
                  >
                    Register Now!
                  </a>
                </label>
              </div>
            )}

            <div className="form-control mt-6">
              <button className="btn btn-primary w-full" type="submit" disabled={loading}>
                {loading ? "Loading..." : buttonText}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right side - Background image */}
      <div
        className="flex-1 hidden lg:flex items-center justify-center"
        style={{ backgroundImage: `url(${background})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        {/* Optional content for the background side */}
      </div>
    </div>
  );
}

export default Form;
