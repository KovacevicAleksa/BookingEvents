const config = {
    url:{
      baseURL: 'http://localhost',
    },
    api: {
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8081',
      endpoints: {
        login: '/login',
        registration: '/register',
        editpassword: '/edit/password/',
        viewevents: '/view/events',
        adminaddevents: '/admin/add/events',
        adminaccounts: '/admin/accounts',
        deleteevents: '/delete/events/',
        deleteusers: '/delete/users/',
        qrcodeGenerator: '/generate-qrcode',
      }
    }
  };
  
  export default config;