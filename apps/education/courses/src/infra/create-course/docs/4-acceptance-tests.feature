Feature: Create Course

Scenario: Successfully creating a course
  Given the request is valid
  And I am authorised to access the source
  And a matching record is found at the source
  And the returned source populates a valid course
  And the source does not already exist in our DB
  When I create a course
  Then a new record should have been created in the repository
  And no result is returned

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to create a course
  Then I should receive a RequestInvalidError
  And no result is returned

# Unnecessary
# Scenario: Fail; Unable to connect to source repository

# Unnecessary
# Scenario: Fail; Unable to authenticate with source repository

# Unnecessary
# Scenario: Fail; Source not found for ID provided

Scenario: Fail; Problems accessing source repository
  Given the request is valid
  And I am authorised to access the source
  And I have an issue accessing the source repository
  When I attempt to create a course
  Then I should receive a RepositoryServerError
  And no result is returned

# Unnecessary
# Scenario: Fail; Source does not translate into a valid Course

# Unnecessary
# Scenario: Fail; Source is already associated with a Course

# Unnecessary
# Scenario: Fail; Source already exists in our DB
