Feature: Create Competition

Scenario: Successfully creating a competition
  Given the request is valid
  And a matching record is found at the source
  When I attempt to create a competition
  Then a new record should have been created in the repository
  And no result is returned

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to create a competition
  Then I should receive a RequestInvalidError
  And no result is returned

# Unnecessary
# Scenario: Fail; Unable to connect to source repository

# Unnecessary
# Scenario: Fail; Unable to authenticate with source repository

# Unnecessary
# Scenario: Fail; Source not found for ID provided

# TODO
# Scenario: Fail; Problems accessing source repository
#   Given the request is valid
#   And I am authorised to access the source
#   And I have an issue accessing the source repository
#   When I attempt to create a competition
#   Then I should receive a RepositoryServerError
#   And no result is returned

# Unnecessary
# Scenario: Fail; Source does not translate into a valid Competition

# Unnecessary
# Scenario: Fail; Source is already associated with a Competition

# Unnecessary
# Scenario: Fail; Source already exists in our DB
