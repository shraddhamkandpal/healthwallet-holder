import React, {useEffect, useState} from 'react'
import Routes from './Routes'
import { Link, withRouter } from 'react-router-dom'
import { LinkContainer } from 'react-router-bootstrap'
import { Nav, Navbar, NavItem } from 'react-bootstrap'
import './App.css'

import SdkService from './utils/sdkService'
import {TokenModalProvider} from "./containers/TokenModal";
import {MessageService} from "./utils/messageService";
import MessageListener from "./containers/MessageListener";

import drivingLicenseLogo from './assets/images/icons/driving-license.svg';
import companyNameLogo from './assets/images/icons/company-name.png';

function App(props) {
  window.sdk = new SdkService()
  const [isAuthenticated, userHasAuthenticated] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      window.sdk.init().then(networkMember => {
        window.messageService = new MessageService(networkMember)
      }).catch(console.error)
    } else {
      window.messageService = null
    }
  }, [isAuthenticated])

  async function handleLogout(event) {
    event.preventDefault()

    userHasAuthenticated(false)

    try {
      await window.sdk.signOut()
      props.history.push('/login')
    } catch (error) {
      console.log('error on logout', error)
    }
  }

  return (
    <div className='App'>
      <TokenModalProvider>
        {isAuthenticated && <MessageListener />}
        <Navbar collapseOnSelect className='navbar bg-orange'>
          <Navbar.Brand>
            <img src={drivingLicenseLogo} className='logo-icon' alt='logo'/>
            <img src={companyNameLogo} className='logo-name' alt='logo-name'/>
          </Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse>
            <Nav pullRight>
              { isAuthenticated
                ? <>
                    <LinkContainer to='/change-username'>
                       <NavItem>Change Attribute</NavItem>
                     </LinkContainer>

                    <LinkContainer to='/change-password'>
                       <NavItem>Change Password</NavItem>
                     </LinkContainer>

                    <NavItem onClick={handleLogout}>Logout</NavItem>
                  </>
                : <>
                    <LinkContainer to='/signup-with-did'>
                      <NavItem>Sign Up with DID</NavItem>
                    </LinkContainer>
                    <LinkContainer to='/signup'>
                      <NavItem>Sign Up</NavItem>
                    </LinkContainer>
                    <LinkContainer to='/login'>
                      <NavItem>Login</NavItem>
                    </LinkContainer>
                    <LinkContainer to='/passwordless-login'>
                      <NavItem>Passwordless Login</NavItem>
                    </LinkContainer>
                  </>
              }
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        <div className='body'>
          <Routes appProps={{ isAuthenticated, userHasAuthenticated }} />
        </div>
      </TokenModalProvider>
    </div>
  )
}

export default withRouter(App)
