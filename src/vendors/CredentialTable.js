import React, {useState, useEffect} from 'react';
import { Table } from 'react-bootstrap'

const CredentialTable = ({ credentials }) => {
    const [vcData, setVCData] = useState([]);
    
    useEffect(() => {
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

      setVCData(initialiseVCData(credentials))
    }, [credentials])

    const extractLinkFromIDDocument = (cred, key) => {
      if (cred.hasIDDocument){
        return JSON.parse(cred.hasIDDocument.hasIDDocument.idClass).drivingClass
      } else {
        return null
      }
    }

    return <div>
        <Table bordered>
              <thead className="thead-light">
                <tr>
                  <th>Index</th>
                  <th>Issuer</th>
                  <th>Expiry Date</th>
                  <th>Record Type</th>
                  <th>Link</th>
                </tr>
              </thead>
              <tbody>
                {
                  vcData.map((cred, index) => {
                    return (
                      <tr key={index+1}>
                        <th scope='row'>{index+1}</th>
                        <td>{cred.hasIDDocument ?  cred.hasIDDocument.hasIDDocument.issuer : ''}</td>
                        <td>{cred.hasIDDocument ?  cred.hasIDDocument.hasIDDocument.issueDate : ''}</td>
                        <td>{cred.hasIDDocument ?  cred.hasIDDocument.hasIDDocument.documentType : 'ID Document'}</td>
                        <td><a>{cred.link || extractLinkFromIDDocument(cred) || '' }</a></td>
                      </tr>
                    )
                  })
                }
              </tbody>
            </Table>
    </div>
}

export default CredentialTable;