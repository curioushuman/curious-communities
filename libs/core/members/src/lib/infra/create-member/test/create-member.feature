Feature: Create Member

Scenario: Successfully creating a member by Source Id
  Given the request is valid
  When I attempt to create a member
  Then a new record should have been created
  And saved member is returned within payload

Scenario: Successfully creating a member by email
  Given the request is valid
  When I attempt to create a member
  Then a new record should have been created
  And saved member is returned within payload

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to create a member
  Then I should receive a RequestInvalidError

Scenario: Fail; Source not found for ID provided
  Given no record exists that matches our request
  When I attempt to create a member
  Then I should receive a RepositoryItemNotFoundError

Scenario: Fail; Source does not translate into a valid Member
  Given a matching record is found at the source
  And the returned source does not populate a valid Member
  When I attempt to create a member
  Then I should receive a SourceInvalidError

# TODO - I would prefer this to be ItemConflictError
Scenario: Fail; Source already exists in our DB
  Given a matching record is found at the source
  And the source DOES already exist in our DB
  When I attempt to create a member
  Then I should receive undefined
  # Then I should receive a RepositoryItemConflictError

# TODO - needs to be implemented
# Scenario: Fail; internal error occurred
#   Given the request is valid
#   And an internal error occurs during member creation
#   When I attempt to create a member
#   Then I should receive an error
