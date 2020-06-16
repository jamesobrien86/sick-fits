import React from 'react'
import gql from 'graphql-tag';
import { Query } from 'react-apollo'
import Error from './ErrorMessage'
import Head from 'next/head'
import { perPage } from '../config'
import Link from 'next/link'
import PaginationStyles from './styles/PaginationStyles'


const  PAGINATION_QUERY = gql`
    query PAGINATION_QUERY {
        itemsConnection {
            aggregate {
                count 
            }
        }
    }
`;


const Pagination = props =>(   
        <Query query={PAGINATION_QUERY}>
            {
                ({data, loading, error}) => {
                    if(error) return <Error error={error} />
                    if(loading) return <p>Loading...</p>
                    const count = data.itemsConnection.aggregate.count;
                    const pages = Math.ceil(count / perPage);
                    const page = props.page;
                    return (
                        <PaginationStyles>
                            <Head>
                                <title>Sick Fits - Page {page} of {pages}</title>
                            </Head>
                            
                            <Link                               
                                prefetch
                                href={{
                                    pathname: 'items',
                                    query:{ page: page - 1 }
                                }}>
                                <a  className="prev" 
                                    aria-disabled={page <= 1}> 
                                    Prev
                                </a>
                            </Link>
                            <p>Page {props.page} of {pages}</p>
                            <Link 
                                prefetch
                                href={{
                                    pathname: 'items',
                                    query:{ page: page + 1 }
                                }}>
                                <a  className="next"
                                    aria-disabled={page >= pages}> 
                                    Next
                                </a>
                            </Link>
                        </PaginationStyles>
                    )                       
                }
            }
        </Query>    
)

export default Pagination;