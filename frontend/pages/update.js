import UpdateItem from '../components/UpdateItem'
const Update = ({query}) => (
    <div>
        <h3>Update</h3>
        <UpdateItem id={query.id} />
    </div>
)

export default Update;