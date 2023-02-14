Feature: Update Group

# Scenario: Successfully updating a group from source
#   Given a matching record is found at the source
#   And the returned source populates a valid group
#   And the source does exist in our DB
#   When I attempt to update a group
#   Then the related record should have been updated in the repository
#   And saved group is returned

Scenario: Successfully updating a group from course
  Given a matching record is found at the source
  And the returned source populates a valid group
  And the source does exist in our DB
  When I attempt to update a group
  Then the related record should have been updated in the repository
  And saved group is returned

Scenario: Fail; Source does not translate into a valid group
  Given a matching record is found at the source
  And the returned source does not populate a valid group
  When I attempt to update a group
  Then I should receive a SourceInvalidError
