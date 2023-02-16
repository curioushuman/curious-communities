Feature: Update GroupMember

# Scenario: Successfully updating a group member from source
#   Given a matching record is found at the source
#   And the returned source populates a valid group member
#   And the source does exist in our DB
#   When I attempt to update a group member
#   Then the related record should have been updated in the repository
#   And saved group member is returned

Scenario: Successfully updating a group member from course
  Given a matching record is found at the source
  And the returned source populates a valid group member
  And the source does exist in our DB
  When I attempt to update a group member
  Then the related record should have been updated in the repository
  And saved group member is returned

# Scenario: Fail; Source does not translate into a valid group member
#   Given a matching record is found at the source
#   And the returned source does not populate a valid group member
#   When I attempt to update a group member
#   Then I should receive a InternalRequestInvalidError
