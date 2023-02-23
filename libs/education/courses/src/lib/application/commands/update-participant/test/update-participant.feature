Feature: Update Participant

Scenario: Successfully updating a participant
  Given a matching record is found at the source
  And the returned source populates a valid participant
  And the source does exist in our DB
  When I attempt to update a participant
  Then the related record should have been updated in the repository
  And saved participant is returned

Scenario: Fail; Source does not translate into a valid Participant
  Given a matching record is found at the source
  And the returned source does not populate a valid Participant
  When I attempt to update a participant
  Then I should receive a InternalRequestInvalidError

Scenario: Fail; Source is an invalid status to be updated in admin
  Given a matching record is found at the source
  And the returned source has an invalid status
  When I attempt to update a participant
  Then I should receive a InternalRequestInvalidError

