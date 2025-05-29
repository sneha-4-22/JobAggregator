import { Navigate, Outlet } from 'react-router-dom'
import PropTypes from 'prop-types'

function ProtectedRoute({ isAllowed, redirectPath = '/', children }) {
  if (!isAllowed) {
    return <Navigate to={redirectPath} replace />
  }

  return children ? children : <Outlet />
}
ProtectedRoute.propTypes = {
  isAllowed: PropTypes.bool.isRequired,
  redirectPath: PropTypes.string,
  children: PropTypes.node
}

export default ProtectedRoute
