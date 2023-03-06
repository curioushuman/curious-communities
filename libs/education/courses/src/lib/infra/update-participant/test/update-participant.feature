Feature: Update Participant

Scenario: Successfully updating a participant
  Given the request is valid
  When I attempt to update a participant
  Then the related record should have been updated
  And saved participant is returned within payload

Scenario: Successfully updating a participant from source
  Given the request is valid
  And a matching record is found at the source
  When I attempt to update a participant
  Then the related record should have been updated in the repository
  And saved participant is returned within payload

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to update a participant
  Then I should receive a RequestInvalidError

Scenario: Fail; Source not found for ID provided
  Given no record exists that matches our request
  When I attempt to update a participant
  Then I should receive a RepositoryItemNotFoundError

Scenario: Fail; Participant not found for ID provided
  Given a matching record is found at the source
  And the returned source populates a valid participant
  And the source does NOT exist in our DB
  When I attempt to update a participant
  Then I should receive a RepositoryItemNotFoundError

Scenario: Fail; Source is an invalid status to be updated in admin
  Given a matching record is found at the source
  And the returned source has an invalid status
  When I attempt to update a participant
  Then I should receive a SourceInvalidError

# TODO - needs to be implemented
# Scenario: Fail; internal error occurred
#   Given the request is valid
#   And an internal error occurs during participant update
#   When I attempt to update a participant
#   Then I should receive an error
#   And no result is returned
