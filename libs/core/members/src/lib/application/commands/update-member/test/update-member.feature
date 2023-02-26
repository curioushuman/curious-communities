Feature: Update Member

Scenario: Successfully updating a member
  Given the request is valid
  And the source does exist in our DB
  When I attempt to update a member
  Then the related record should have been updated
  And saved member is returned

Scenario: Successfully updating a member from source
  Given a matching record is found at the source
  And the returned source populates a valid member
  And the source does exist in our DB
  When I attempt to update a member
  Then the related record should have been updated
  And saved member is returned

Scenario: Fail; Source does not translate into a valid Member
  Given a matching record is found at the source
  And the returned source does not populate a valid Member
  When I attempt to update a member
  Then I should receive a SourceInvalidError

