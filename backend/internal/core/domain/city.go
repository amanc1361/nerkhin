package domain

type City struct {
	ID   int64
	Name string
	Type CityType `gorm:"column:type_c"`
}

type CityType int16

const (
	start CityType = iota
	NormalCity
	ImportantCity
	CountryCapital
	end
)

func IsValidCityType(t int16) bool {
	return t > int16(start) && t < int16(end)
}

func (City) TableName() string {
	return "city"
}
