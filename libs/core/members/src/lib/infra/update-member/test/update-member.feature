Feature: Update Member

Scenario: Successfully updating a member
  Given the request is valid
  When I attempt to update a member
  Then the related record should have been updated
  And saved member is returned within payload

Scenario: Successfully updating a member from source
  Given the request is valid
  And a matching record is found at the source
  When I attempt to update a member
  Then the related record should have been updated
  And saved member is returned within payload

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to update a member
  Then I should receive a RequestInvalidError
  And no result is returned

Scenario: Fail; Source not found for ID provided
  Given no record exists that matches our request
  When I attempt to update a member
  Then I should receive a RepositoryItemNotFoundError

Scenario: Fail; Member not found for ID provided
  Given a matching record is found at the source
  And the returned source populates a valid member
  And the source does NOT exist in our DB
  When I attempt to update a member
  Then I should receive a RepositoryItemNotFoundError

Scenario: Fail; Source does not translate into a valid Member
  Given a matching record is found at the source
  And the returned source does not populate a valid Member
  When I attempt to update a member
  Then I should receive a SourceInvalidError

Scenario: Fail; Source does not require update
  Given the request is valid
  And a matching record is found at the source
  And the source matches the member in our DB
  When I attempt to update a member
  Then the related record should NOT been updated
  And no-change result is returned

# TODO - needs to be implemented
# Scenario: Fail; internal error occurred
#   Given the request is valid
#   And an internal error occurs during member update
#   When I attempt to update a member
#   Then I should receive an error
#   And no result is returned
