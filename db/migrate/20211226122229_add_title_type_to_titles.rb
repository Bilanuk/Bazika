class AddTitleTypeToTitles < ActiveRecord::Migration[6.1]
  def change
    add_column :titles, :title_type, :string
  end
end
