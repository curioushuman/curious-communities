## Authentication

### To generate private key and certificate

```bash
# Don't add passphrase
ssh-keygen -t rsa -b 4096 -m PEM -f jwtRS256.key
openssl rsa -in jwtRS256.key -pubout -outform PEM -out jwtRS256.key.pub
# Don't add password
openssl req -new -key jwtRS256.key -out server.csr
openssl x509 -req -sha256 -days 365 -in server.csr -signkey jwtRS256.key -out server.crt
```

### Setup in Salesforce

- Create the connected app
  - Enable OAuth Settings
    - Callback URLs:
      - https://oauth.pstmn.io/v1/callback
        - This is so we can use Postman to test the API
      - https://oauthdebugger.com/debug
        - So we can use the debugger
        - https://mannharleen.github.io/2020-03-03-salesforce-jwt/
      - sfdc://oauth/jwt/success
  - Use digital signatures
    - Upload the crt file you create
  - Pick scopes
    - Manage user data via APIs
    - Perform requests at any time
  - Require secret for web flow = FALSE
  - Require secret for refresh token = FALSE
- Manage the app
  - Edit policies
    - Relax IP restrictions
    - Refresh token never expires
- Pre-approve / authorize the app
  - https://<your instance>.salesforce.com/services/oauth2/authorize?response_type=token&client_id=<consumer key>&redirect_uri=sfdc://oauth/jwt/success
    - https://asiapacificforum.lightning.force.com/services/oauth2/authorize?response_type=token&client_id=3MVG9YDQS5WtC11oFYmACQfTz7277TTj1VAS5ENZSNCJxgO8fL8KdfPyU1z28aJR3T0iwTUhFHTfJjOnPcvXN&redirect_uri=sfdc://oauth/jwt/success
- If you make any changes, you have to re-authorize the app

### To use the key within the code

- Always import from file
  - Use the jwtRS256.key
- jwt.sign(expiresIn) ABSOLUTELY HAS TO BE IN PLACE
  - And after the expiry period you'll need to manually re-authorize the app
    - Yet to be confirmed
- You MUST USE the instance_url from the response to request data
  - https://<instance_url>/services/data/vXX.X/XXXXX

### Additional notes

- JWT flow never issues refresh token, it never expires

### Useful articles

- https://mannharleen.github.io/2020-03-03-salesforce-jwt/
  - Led me to the OAuth debugger
- https://medium.com/@tou_sfdx/salesforce-oauth-jwt-bearer-flow-cc70bfc626c2
