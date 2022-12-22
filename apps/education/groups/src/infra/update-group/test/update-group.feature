Feature: Update Group

# TODO: implement this scenario
# Scenario: Successfully updating a group
#   Given the request is valid
#   When I attempt to update a group
#   Then a new record should have been updated in the repository
#   And no result is returned

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to update a group
  Then I should receive an InternalRequestInvalidError
  And no result is returned

# TODO: implement this scenario
# Scenario: Fail; internal error occurred
#   Given the request is valid
#   And an internal error occurs during group updation
#   When I attempt to update a group
#   Then I should receive an error
#   And no result is returned
