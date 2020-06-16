import Reset from '../components/Reset';

const ResetPassword = (props) => (
    <div>
        <h3>Reset your password</h3>
        <Reset resetToken={props.query.resetToken} />
    </div>
)

export default ResetPassword;