import CreateItem from '../components/CreateItem';
import PleaseSignIn from '../components/PleaseSignIn';
const Sell = (props) => (
    <div>
        <PleaseSignIn>
            <h3>Sell!!</h3>
            <CreateItem />
        </PleaseSignIn>       
    </div>
)

export default Sell;