import React from 'react';
import { Table } from 'react-bootstrap'

const CredentialTable = ({ credentials }) => {
    console.log(credentials)
    // To get Name Credential credential.credentialSubject.data.givenName
    // To get Driving License credential.credentialSubject.data.hasIDDocument.hasIDDocument.documentType
    const searchQueue = {
      NameCredentialPersonV1: ['givenName'],
      IDDocumentCredentialPersonV1: ['documentType']
    }

    const somefunc = (credentials) => {
      let output2 = credentials.map((cred) => {
        let template = {
          detail: cred.credential.credentialSubject.data.givenName,
          credentialtype: cred.credential.type[cred.credential.type.length-1]
        }

        // console.log(template)
        return template
      })
      return output2
    }

    console.log(somefunc(credentials))
    return <div>
        <Table bordered>
              <thead className="thead-light">
                <tr>
                  <th>Index</th>
                  <th>Detail</th>
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