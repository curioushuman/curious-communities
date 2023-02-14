Feature: Create Group Member

# Scenario: Successfully creating a group from source
#   Given a matching record is found at the source
#   And the returned source populates a valid group
#   And the source does not already exist in our DB
#   When I attempt to create a group
#   Then a new record should have been created
#   And saved group is returned

Scenario: Successfully creating a group member from course
  Given a matching record is found at the source
  And the returned source populates a valid group member
  And the source does not already exist in our DB
  When I attempt to create a group member
  Then a new record should have been created
  And saved group member is returned

Scenario: Fail; Source does not translate into a valid group member
  Given a matching record is found at the source
  And the returned source does not populate a valid group member
  When I attempt to create a group member
  Then I should receive a SourceInvalidError
