import { Query } from 'react-apollo';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import Error from './ErrorMessage';
import Table from './styles/Table';
import SickButton from './styles/SickButton';


const possiblePermissions = [
  'ADMIN',
  'USER',
  'MOD',
  'ITEMCREATE',
  'ITEMUPDATE',
  'ITEMDELETE',
  'PERMISSIONUPDATE',
];

const ALL_USERS_QUERY = gql`
  query {
    users {
      id
      name
      email
      permissions
    }
  }
`


const Permissions = props => (
  <Query query={ALL_USERS_QUERY}>
    {({data,loading, error}) => 
      console.log(data) || (
        <div>
        <Error error={error} />
        <div>
          <h2>Manage your Permissions</h2>
          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                {
                  possiblePermissions.map(permission => 
                    <th key={permission}>{permission}</th>
                  )
                }
                <th>Click to update</th>
              </tr>
            </thead>
            <tbody>
              {
                data.users.map(user => <UserPermissions key={user.id} user={user} />)
              }
            </tbody>
          </Table>
        </div>
        </div>

    )}

  </Query>
)

class UserPermissions extends React.Component{
  static propTypes = {
    user: PropTypes.shape({
      name: PropTypes.string,
      email: PropTypes.string,
      id: PropTypes.string,
      permissions: PropTypes.array,
    }).isRequired,
  };
  // ok to set state as props due to props being seeded from the 
  // other component
  state = { 
    permissions: this.props.user.permissions,
  }

  handlePermissionChange = e => {
    const checkbox = e.target;
    // take a copy of current permissions
    let updatedPermissions = [...this.state.permissions];
    // remove or add permssions
    if(checkbox.checkbox){
      // add it in
      updatedPermissions.push(checkbox.value);
    } else {
      updatedPermissions = updatedPermissions.filter(permission => (
        permission !== updatedPermissions
      ));
    }
    this.setState({permissions:updatedPermissions});
    console.log(updatedPermissions)
  }

  render(){
    const user = this.props.user;
    return (
      <tr>
        <td>{user.name}</td>
        <td>{user.email}</td>
        {possiblePermissions.map(permission => (
          <td key={permission}>
            <label htmlFor={`${user.id}-permission-${permission}`}>
              <input 
                type="checkbox" 
                checked={this.state.permissions.includes(permission)}
                value={permission}
                onChange={this.handlePermissionChange}
              />
            </label>
          </td>
        ))}
        <td>
          <SickButton>
            Update
          </SickButton>
        </td>
      </tr>
    )
  }
}

export default Permissions;