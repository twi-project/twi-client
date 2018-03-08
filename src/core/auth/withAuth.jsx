// UNAUTHORIZED_EXCEPTION
import {h, Component} from "preact"
import {func, shape, string} from "prop-types"
import {observer} from "mobx-preact"

import isFunction from "lodash/isFunction"

import db from "core/db/tokens"

import AuthTokenPayload from "./model/AuthTokenPayload"

const assign = Object.assign

const withAuth = Target => {
  const name = Target.displayName || Target.name || "Unknown"

  class Auth extends Component {
    static displayName = `${Auth.name}(${name})`

    static propTypes = {
      onError: func.isRequired,
      auth: shape({
        accessToken: shape({
          payload: string.isRequired,
          type: string.isRequired
        }),
        refreshToken: shape({
          payload: string.isRequired,
          type: string.isRequired
        })
      })
    }

    static defaultProps = {
      auth: {
        accessToken: null,
        refreshToken: null
      }
    }

    static async getInitialProps(...args) {
      let props = {}

      const accessToken = await db.getItem("accessToken")
      const refreshToken = await db.getItem("refreshToken")

      const auth = AuthTokenPayload.create({accessToken, refreshToken})

      if (auth.isAccessExpired) {
        await auth.refreshAccessToken()
      }

      if (isFunction(Target.getInitialProps)) {
        props = assign({}, await Target.getInitialProps(...args))
      }

      return assign({}, props, {auth})
    }

    static propTypes = {
      onError: func.isRequired
    }

    componentWillMount() {
      // NOTE: 600000 = each 10 minutes.
      this.__timer = setInterval(this.__refreshAccessOnTimer, 600000)
    }

    componentWillUnmount() {
      if (this.__timer) {
        clearInterval(this.__timer)
      }
    }

    __timer = null

    __refreshAccessOnTimer = () => {
      this.props.auth.refreshAccessToken()
        .catch(this.props.onError)
    }

    render() {
      return h(observer(Target), this.props)
    }
  }

  if (isFunction(Target.getInitialProps)) {
    Auth.getInitialProps = Target.getInitialProps
  }

  return Auth
}

export default withAuth
