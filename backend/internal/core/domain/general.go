package domain

type SortOrder int

const (
	orderStart SortOrder = iota
	None
	DESC
	ASC
	orderEnd
)

func IsSortOrderValid(order int) bool {
	return order > int(orderStart) && order < int(orderEnd)
}
