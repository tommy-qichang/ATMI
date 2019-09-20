import React from 'react';
import { Form, Icon, Input, Button, Checkbox, message, Modal, Row, Col } from 'antd';
import styles from '../../styles/LoginForm.css';
import axios from 'axios';
//import jwt from 'jsonwebtoken';

class LoginForm extends React.Component {

  /*   constructor(props) {
      super(props);
      this.state = {
        disableButton: true,
        usernameValue: ""
          };
    } */

  validUsername = false;   //whether username is in right format
  //validConfirmUsername = false;   //whether username for resetting password is in right format
  validPassword = false;   //whether password is in right format
  inputConfirmUsername = null;

  username = "";

  state = {
    disableButton: true,
    usernameValue: "",
    showConfirmEmail: false   //Whether to show ConfirmEmail modal for resetting password
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.validate(values);
      }
    });
  };

  validate(values) {
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
    this.username = values.username;
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
    this.props.onLoginSuccess(this.username);
  }

  onUsernameChange = e => {
    let reg = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
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

  onResetButtonClick = e => {
    //this.props.showConfirmEmail();
         this.setState({
          showConfirmEmail: true
        }); 
  }

  onConfirmEmail = e => {
    this.checkEmail();
  }


  checkEmail = () => {
    let reg = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
    if (!this.inputConfirmUsername) {
      return;
    }
    let username = this.inputConfirmUsername.state.value;
    if (reg.test(username)) {
      this.proccessReset(username);
    }
    else {
      message.error("Please enter username of email format", 2);
    }
  }

  proccessReset = values => {
    message.success("Email for resetting password has been sent", 2);
    this.setState({
      showConfirmEmail: false
    });
  }

  onConfirmEmailCancel = e => {
    this.setState({
      showConfirmEmail: false
    });
  }

  /*   onConfirmUsernameChange = e => {
      let reg = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
      if (e.target.value && reg.test(e.target.value)) {
        this.validConfirmUsername = true;
      }
      else {
        this.validConfirmUsername = false;
      }
      if (this.validConfirmUsername) {
        this.setState({
          disableConfirmButton: false
        });
      }
      else {
        this.setState({
          disableConfirmButton: true
        });
      }
    } */

  /*   handleConfirmSubmit = e => {
      e.preventDefault();
      this.props.form.validateFields((err, values) => {
        if (!err) {
          this.proccessReset(values);
        }
      });
    } */

  /*   onConfirmEmail = e => {
      let reg = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
      //let inputConfirmUsernam = component.inputConfirmUsernam;
      //console.log("inputConfirmUsernam: ", inputConfirmUsernam);
      //console.log("this.inputConfirmUsernam: ", this.inputConfirmUsernam);
      if(!this.inputConfirmUsername) {
        return;
      }
      let username = this.inputConfirmUsernam.textAreaRef.value;
      if (reg.test(username)) {
        this.proccessReset(username);
      }
      else{
        message.error("Please enter username of email format");
      }
    } */

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className={styles.background}>
        <br />
        <Form onSubmit={this.handleSubmit} className={styles.loginForm} style={{ margin: 1 }} autoComplete="off">
          <Form.Item>
            {getFieldDecorator('username', {
              rules: [{ required: true, message: 'Please enter your username' },
              { pattern: new RegExp(/^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/), message: 'Please enter username of email format' }
              ],
            })(
              <Input
                prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="Please enter your username"
                //maxLength={11}
                onChange={this.onUsernameChange}
                autoComplete="off"
              />,
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('password', {
              rules: [{ required: true, message: 'Please input your password' },
              { min: 6, max: 16, message: 'Please enter your password (6-16 characters)' }],
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
            })(<Checkbox><label /* style={{color: "#ccc"}} */ className={styles.font}>Remember Password</label></Checkbox>)}
            <a className={styles.loginFormForgot} href="javascript:;" onClick={this.onResetButtonClick}>
              Forget Password
          </a>
            <Button type="primary" htmlType="submit" ghost className={styles.loginFormButton} disabled={this.state.disableButton}>
              Login
          </Button>
          <label className={styles.font}>No Account Yet? </label>
          <a href="javascript:;" onClick={this.props.onRegisterButtonClick}>Apply For One</a>
          </Form.Item>
        </Form>
        <Modal
          title="Reset Password"
          visible={this.state.showConfirmEmail}
          onCancel={this.onConfirmEmailCancel}
          centered
          footer={[
            <Button type="primary" key="submit" ghost
              /*  className={styles.loginFormButton}  */
              /* disabled={this.state.disableConfirmButton} */
              onClick={this.onConfirmEmail}
            >
              Confirm
           </Button>
            /*  <Button key="submit" type="primary" size="small" onClick={this.onConfirmEmail}>
                 Confirm
             </Button>,
             <Button key="back" size="small" onClick={this.onConfirmEmailCancel}>
                 Cancel
             </Button>, */
          ]}
          width="26%"
          bodyStyle={{ width: "96%", marginTop: 6, marginBottom: 6, paddingTop: 6, paddingBottom: 6 }}
        >
          <Row type="flex" justify="center">
            <Col>
              <div style={{ textAlign: "left" }}>
                Please confirm your username(email address):
                  </div>
              <br />
              <Input
                //prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="Please enter your username"
                //maxLength={11}
                //onChange={this.onConfirmUsernameChange}
                //autoComplete="off"
                ref={target => (this.inputConfirmUsername = target)}
              />
              {/*     <div>
                <br />
                  <Button type="primary" htmlType="submit" 
                  className={styles.loginFormButton} 
                  onClick={this.onConfirmEmail(this)}
                  >
                    Confirm
          </Button>
          </div> */}

            </Col>
          </Row>
        </Modal>
      </div>
    );
  }
}

const WrappedNormalLoginForm = Form.create({ name: 'normal_login' })(LoginForm);
export default WrappedNormalLoginForm;
