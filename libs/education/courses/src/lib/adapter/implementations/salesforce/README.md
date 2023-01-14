## Authentication

### To generate private key and certificate

```bash
ssh-keygen -t rsa -b 4096 -m PEM -f jwtRS256.key
# Don't add passphrase
openssl rsa -in jwtRS256.key -pubout -outform PEM -out jwtRS256.key.pub
# Don't add password
openssl req -new -key jwtRS256.key -out server.csr
openssl x509 -req -sha256 -days 365 -in server.csr -signkey jwtRS256.key -out server.crt
```

### To use the key within the code

- Always import from file
- Use the jwtRS256.key

### Setup in Salesforce

- Create the connected app
  - Enable OAuth Settings
    - Callback URL: sfdc://oauth/jwt/success
  - Use digital signatures
    - Upload the crt file you create
  - Pick scopes
    - Manage user data via APIs
    - Perform requests at any time
  - Require secret for web flow
  - Require secret for refresh token
- Manage the app
  - Edit policies
    - Relax IP restrictions
    - Permitted users = admin approved
  - Then select the appropriate profiles
