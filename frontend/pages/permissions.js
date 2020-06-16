import PleaseSignIn from '../components/PleaseSignIn';
import Permissions from '../components/Permissions';

const PermissionsPage = (props) => (
    <div>
        <PleaseSignIn>
            <h3>Permissions</h3>
            <Permissions />
        </PleaseSignIn>       
    </div>
)

export default Permissions;