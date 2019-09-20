import React from 'react';
import { Form, Icon, Input, Button, /* Checkbox, */ message, /* Statistic, */ Row, Col } from 'antd';
import styles from '../../styles/LoginForm.css';

class ResetPasswordForm extends React.Component {
  
  state = {
    disableButton: true
  };
  
  onPasswordChange = e => {
    if (e.target.value.length >= 6) {
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

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.validate(values);
      }
    });
  }  

  validate(values) {
    //values.password;
    message.success("Successfully resetted password！", 2);
    this.props.onResetPasswordSucceed();
  }
  
  render() {
        const { getFieldDecorator } = this.props.form;
        return (
           <div className={styles.background}>
          <Form onSubmit={this.handleSubmit} className={styles.loginForm} style={{margin: 1}} autoComplete="off" /* style={{backgroundColor: "#fff"}} */>
            <Form.Item>
               <label className={styles.font}>Username: <strong>{this.props.username}</strong></label>
            </Form.Item>
            <Form.Item>
              {getFieldDecorator('password', {
                rules: [{ required: true, message: 'Please input your password' },
                {min:6, max:16, message:'Please enter your password (6-16 characters)'}
              ],
              })(
                <Input.Password
                  prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                  /* type="password" */
                  placeholder="Reset password (6-16 characters)"
                  maxLength={16}
                  onChange={this.onPasswordChange}
                  autoComplete="off"
                />,
              )}
            </Form.Item>
              <Form.Item>
              <Button type="primary" htmlType="submit" ghost className={styles.loginFormButton} disabled={this.state.disableButton}>
                Reset password
              </Button>
            {/*   已有账号？ <a href="javascript:;" onClick={this.props.onLoginButtonClick}>去登陆</a> */}
            </Form.Item>
          </Form>
           </div>
        );
      }
} 

const WrappedNormalResetPasswordForm = Form.create({ name: 'normal_resetPassword' })(ResetPasswordForm);
export default WrappedNormalResetPasswordForm;