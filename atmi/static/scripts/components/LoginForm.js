import React from 'react';
import { Form, Icon, Input, Button, Checkbox, message } from 'antd';
import styles from '../../styles/LoginForm.css';
import axios from 'axios';
//import jwt from 'jsonwebtoken';

class LoginForm extends React.Component {
  
  validUsername = false;   //whether username is in right format
  validPassword = false;   //whether password is in right format

  state = {
    disableButton: true,
    usernameValue: ""
  };
  
  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.validate(values);
      }
    });
  };

validate (values) {
/*   let response;
   try{
   response = await axios.post('http://106.14.78.43:8080/api/authenticate', {
      username: `+86-${values.username}`, password: values.password
  }); 
}
  catch(ex) {
    console.log("login exception:", ex);
    if(ex.message === "Request failed with status code 400" || ex.message === "Request failed with status code 401") {
      message.error('Username and password do not match, login failed！');
    }
  }
  console.log("login response:", response);
  if(response) {
    if(response.status === 200) {
    localStorage.setItem('jwtToken', response.data.id_token); 
    setTimeout(this.checkLogin, 200);
    }
  } */
  setTimeout(this.checkLogin, 200);
}

  checkLogin = () => {
    /* if (!(localStorage.getItem('jwtToken'))) {
      setTimeout(this.checkLogin, 200);
    }
    else {
      message.success('Successfully logged in！', 2);
      this.props.onLoginSuccess();
    } */
    message.success('Successfully logged in！', 2);
    this.props.onLoginSuccess();
  }

  onUsernameChange = e => {
    let reg=/^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
  if (e.target.value && reg.test(e.target.value)) {
    this.validUsername = true;
   }
   else {
    this.validUsername = false;
   }
   if (this.validUsername && this.validPassword) {
     this.setState({
        disableButton: false
     });
   }
   else {
    this.setState({
      disableButton: true
   });
   }
  }

  onPasswordChange = e => {
  if (e.target.value.length >= 6) {
    this.validPassword = true;
   }
   else {
    this.validPassword = false;
   }
   if (this.validUsername && this.validPassword) {
     this.setState({
        disableButton: false
     });
   }
   else {
    this.setState({
      disableButton: true
   });
   }
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
       <div className={styles.background}>
      <Form onSubmit={this.handleSubmit} className={styles.loginForm} style={{margin: 1}} autoComplete="off" /* style={{backgroundColor: "#fff"}} */>
        <Form.Item>
          {getFieldDecorator('username', {
            rules: [{ required: true, message: 'Please enter your username' },
            { pattern:new RegExp(/^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/), message:'Please enter username of email format' }
          ],
          })(
            <Input
              prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="Please enter your username"
              maxLength={11}
              onChange={this.onUsernameChange}
              autoComplete="off"
            />,
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator('password', {
            rules: [{ required: true, message: 'Please input your password' },
            {min:6, max:16, message:'Please enter your password (6-16 characters)'}],
          })(
            <Input
              prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
              type="password"
              placeholder="Password (6-16 characters)"
              maxLength={16}
              onChange={this.onPasswordChange}
              autoComplete="off"
            />,
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator('remember', {
            valuePropName: 'checked',
            initialValue: true,
          })(<Checkbox>Remember Password</Checkbox>)}
          <a className={styles.loginFormForgot} href="javascript:;" onClick={this.props.onResetButtonClick}>
            Forget Password
          </a>
          <Button type="primary" htmlType="submit" className={styles.loginFormButton} disabled={this.state.disableButton}>
            Login
          </Button>
          No Account Yet? <a href="javascript:;" onClick={this.props.onRegisterButtonClick}>Apply For One</a>
        </Form.Item>
      </Form>
       </div>
    );
  }
}

const WrappedNormalLoginForm = Form.create({ name: 'normal_login'})(LoginForm);
export default WrappedNormalLoginForm;
