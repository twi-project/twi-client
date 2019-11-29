import {createElement, Component, Fragment} from "react"
import {shape, func, string} from "prop-types"

import connect from "lib/model/connect"

import Title from "common/component/Title"

import Form from "module/auth/common/component/Form"
import Link from "module/auth/common/component/Form/Link"
import Input from "module/auth/common/component/Form/Input"
import Fields from "module/auth/common/component/Form/Fields"
import Button from "module/auth/common/component/Form/Button"
import Footer from "module/auth/common/component/Form/Footer"
import withRedirect from "module/auth/common/hoc/withRedirect"

import {container, recover} from "./login.scss"

const mapStoresToProps = ({logIn}) => ({logIn})

@withRedirect
@connect(mapStoresToProps)
class Login extends Component {
  static propTypes = {
    onError: func.isRequired,
    logIn: shape({
      login: string,
      password: string,
    }).isRequired,
    history: shape({
      push: func.isRequired
    }).isRequired
  }

  submit = () => {
    this.props.logIn.authenticate()
      .then(() => this.props.history.push("/"))
      .catch(this.props.onError)
  }

  render() {
    const {logIn} = this.props
    const {username, password} = logIn

    return (
      <>
        <Title title="Login" />

        <Form className={container} onSubmit={this.submit}>
          <Fields>
            <Input
              type="text"
              name="username"
              placeholder="Login..."
              autoComplete="username"
              value={username}
              onChange={logIn.updateUsername}
            />

            <Input
              type="password"
              name="password"
              placeholder="Password..."
              autoComplete="off"
              value={password}
              onChange={logIn.updatePassword}
            />

            <Button type="submit" disabled={!logIn.isValid}>
              Log in
            </Button>
          </Fields>

          <Footer>
            <Link to="/auth/signup">
              Have no account yet?
            </Link>

            <Link to="/auth/recover" className={recover}>
              Forgot your password?
            </Link>
          </Footer>

        </Form>
      </>
    )
  }
}

export default Login
