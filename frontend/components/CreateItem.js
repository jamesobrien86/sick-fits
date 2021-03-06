import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import Router from 'next/router'
import Form from './styles/Form'
import FormatMoney from '../lib/formatMoney'
import Error from '../components/ErrorMessage'


const CREATE_ITEM_MUTATION = gql`
    mutation CREATE_ITEM_MUTATION(
        $title: String!
        $description: String!
        $image: String
        $largeImage: String
        $price: Int!
     ) {
        createItem(
            title: $title
            description: $description
            image: $image
            largeImage: $largeImage
            price: $price
        ){
            id
        }
    }
`;

export default class CreateItem extends Component {

    state = {
        title:'Bag',
        description:'Bigger bags',
        image:'bag.jpg',
        largeImage:'bag-xl.jpg',
        price:1000,
    }

    handleChange = (e) => {
        const { name, type, value} = e.target;
        const val = type === 'number' ? parseFloat(value) : value;

        this.setState({[name]:val})
    }

     uploadFile = async e => {
        console.log("uplading file")
        const files = e.target.files;
        const data = new FormData();
        data.append('file', files[0]);
        data.append('upload_preset', 'Sick-fits');

        const res = await fetch('http://api.cloudinary.com/v1_1/dskgtxhxb/image/upload',{
            method:'POST',
            body:data
        });

        const file = await res.json();
        console.log(file);
        this.setState({
            image:file.secure_url,
            largeImage:file.eager[0].secure_url
        })
    }

    render() {
        return (
            <Mutation mutation={CREATE_ITEM_MUTATION} variables={this.state}>
                {(createItem,{loading, error }) => (
                    <Form onSubmit={async e => {
                        e.preventDefault()
                        // call the mutation
                        const res = await createItem();
                        console.log(res)
                        Router.push({
                            pathname:'/item',
                            query: { id: res.data.createItem.id},
                            })
                        }}>
                        <Error error={error} />
                        <fieldset disabled={loading} aria-busy={loading}>
                            <label htmlFor="file">
                               Image
                                <input 
                                    type="file" 
                                    id="file" 
                                    name="file" 
                                    placeholder="Upload an image" 
                                    required 
                                    onChange={this.uploadFile}
                                    />
                                    {this.state.image && <img src=
                                    {this.state.image} alt="Upload Preview" />}
                            </label>
                            <label htmlFor="title">
                                Title
                                <input 
                                    type="text" 
                                    id="title" 
                                    name="title" 
                                    placeholder="Title" 
                                    required 
                                    onChange={this.handleChange}
                                    value={this.state.title}
                                    />
                            </label>
                            <label htmlFor="price">
                                Price
                                <input 
                                    type="number" 
                                    id="price" 
                                    name="price" 
                                    placeholder="Price" 
                                    required 
                                    onChange={this.handleChange}
                                    value={this.state.price}
                                    />
                            </label>
                            <label htmlFor="description">
                                Description
                                <textarea 
                                    id="description" 
                                    name="description" 
                                    placeholder="Enter a description" 
                                    required 
                                    onChange={this.handleChange}
                                    value={this.state.description}
                                    />
                            </label>
                            <button type="submit">Submit</button>
                        </fieldset>
                    </Form>
                )}
            </Mutation>
          
        
        )
    }
}

export { CREATE_ITEM_MUTATION };