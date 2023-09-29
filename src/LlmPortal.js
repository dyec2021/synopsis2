/* src/App.js */
import logo from './option4.jpg';
import React, { useEffect, useState } from 'react'
import { Amplify, API, Auth } from 'aws-amplify'
import { withAuthenticator, Button, Heading, TextField, TextAreaField } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsExports from "./aws-exports";
Amplify.configure(awsExports);

const userAPI = "llmdemoapi"
var prompt = "Type your prompt here"
var systemPrompt = "Type your system prompt here"

const LlmPortal = ({ signOut, user }) => {
  const [llmtext, setLlmtext] = useState([])
  const [gettingText,setGettingText] = useState(false)
  function setPrompt(event) {
      prompt = event.currentTarget.value
      console.info('onChange set prompt: ', prompt)
  }
  function handleAPIError(err) {
    console.log(err)
    setLlmtext('Error with API. No response retrieved.')
    setGettingText(false)
  }
  function setSystemPrompt(event) {
    systemPrompt = event.currentTarget.value
    console.info('onChange set system prompt: ', systemPrompt)
  }
  async function fetchLlmText() {
    try {
      const user = await Auth.currentAuthenticatedUser()
      const token = user.signInUserSession.idToken.jwtToken
      const requestHeaders = {
        headers: {
            Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`
        }
      }
      setGettingText(true)
      const result = API.get(userAPI,  "/?prompt=" + prompt.toString() + "&system_prompt=" + systemPrompt.toString(),requestHeaders)
      .then((response) => {
          setLlmtext(response)
          setGettingText(false)
      }).catch(error => handleAPIError(error))
    } catch (err) { 
      console.log('Error with user API')
      setGettingText(false)
      setLlmtext('Error with API. No response retrieved.')
    }
  }

   return (
    <div style={styles.container}>
    <Heading level={1}><img src={logo} alt="logo" height="64" width="64" />Welcome to the LLM-Demo portal <em>{user.username}</em></Heading>
      <div style={{float: 'right'}}>
          <Button onClick={signOut}>Sign out</Button>
      </div>
      <h2>System Prompt</h2>
      <TextAreaField
      label = "This is where you can provide a prompt to the model"
      size="small"
      width="100%"
      defaultValue = "Type your system prompt here"
      onChange={setSystemPrompt}
      rows={3}
      isMultiline={true}  />
    <h2>Prompt</h2>
    <TextAreaField
      label = "This is where you can provide a prompt to the model"
      size="small"
      width="100%"
      defaultValue = "Type your user prompt here"
      onChange={setPrompt}
      rows={5}
      isMultiline={true}  />
    <Button onClick={fetchLlmText} isLoading={gettingText} loadingText="Getting LLM Text" style={styles.button}>Get Text</Button>
    <h2>Response</h2>
    <TextAreaField
      label= "This is where your LLM Response will appear"
      size="small"
      width="100%"
      defaultValue = "LLM Response"
      value={llmtext}
      isReadOnly={true}
      rows={10}
      isMultiline={true}  />
    </div>
  )
}

const styles = {
  container: { width: '80%', margin: '15px auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 20 },
  todo: {  marginBottom: 15 },
  input: { border: 'none', backgroundColor: '#ddd', marginBottom: 10, marginLeft: '5px', padding: 8, fontSize: 18, width: '75%'},
  todoName: { fontSize: 20, fontWeight: 'bold' },
  todoDescription: { marginBottom: 0 },
  button: { backgroundColor: 'orange', color: 'white', outline: 'none', fontSize: 18, padding: '12px 0px' }
}

export default withAuthenticator(LlmPortal);