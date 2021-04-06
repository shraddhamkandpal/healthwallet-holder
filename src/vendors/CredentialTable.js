import React from 'react';
import { Table } from 'react-bootstrap'

const CredentialTable = ({ credentials }) => {
    console.log(credentials)
    return <div>
        <Table bordered>
              <thead className="thead-light">
                <tr>
                  <th>Index</th>
                  <th>ID</th>
                  <th>VC Type</th>
                </tr>
              </thead>
              <tbody>
                {
                  credentials.map((cred, index) => {
                    return (
                      <tr>
                        <th scope='row'>{index+1}</th>
                        <td>{cred.credential.id}</td>
                        {/* <td>{cred.credential.credentialSubject.data.givenName}</td> */}
                        <td>{cred.credential.type[cred.credential.type.length-1]}</td>
                      </tr>
                    )
                  })
                }
              </tbody>
            </Table>
    </div>
}

export default CredentialTable;