import React, {useState, useEffect} from 'react';
import { Table } from 'react-bootstrap'

const CredentialTable = ({ credentials }) => {
    const [vcData, setVCData] = useState([]);

    const removeProp = (obj, propToDelete) => {
      for (let property in obj) {
        if (obj.hasOwnProperty(property)) {
          if (property === propToDelete) {
            delete obj[property];
          } else if (typeof obj[property] == "object") {
            removeProp(obj[property], propToDelete);
          }
        }
      }
      return obj
    }

    const initialiseVCData = (vcData) => {
      let processedVCData = []
      for (let vc in vcData) {
        processedVCData[vc] = vcData[vc].credential.credentialSubject.data
        processedVCData[vc] = removeProp(processedVCData[vc], '@type')
      }
      return processedVCData
    }

    useEffect(() => {
      setVCData(initialiseVCData(credentials))
    }, [])

    const extractEmailFromIDDocument = (cred) => {
      if (cred.hasIDDocument){
        return JSON.parse(cred.hasIDDocument.hasIDDocument.idClass).email
      } else {
        return null
      }
    }

    return <div>
        <Table bordered>
              <thead className="thead-light">
                <tr>
                  <th>Index</th>
                  <th>Given Name</th>
                  <th>Family Name</th>
                  <th>Email</th>
                  <th>VC Type</th>
                </tr>
              </thead>
              <tbody>
                {
                  vcData.map((cred, index) => {
                    return (
                      <tr>
                        <th scope='row'>{index+1}</th>
                        <td>{cred.givenName || cred.name}</td>
                        <td>{cred.familyName || ''}</td>
                        <td>{cred.email || extractEmailFromIDDocument(cred) || '' }</td>
                        <td>{cred.hasIDDocument ?  cred.hasIDDocument.hasIDDocument.documentType : 'ID Document'}</td>
                      </tr>
                    )
                  })
                }
              </tbody>
            </Table>
    </div>
}

export default CredentialTable;