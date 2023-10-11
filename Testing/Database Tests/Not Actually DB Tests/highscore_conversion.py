def array_to_string(arr):
    # Convert the 3D array to a string by flattening it
    flattened = [str(item) for sublist1 in arr for sublist2 in sublist1 for item in sublist2]
    return ' '.join(flattened)

def string_to_array(s):
    # Convert the string back to a 3D array
    elements = s.split()
    flat_list = [int(element) for element in elements]
    
    # Create a 3D array from the flattened
    arr = []
    index = 0
    for dim1 in range(3):
        sublist1 = []
        for dim2 in range(10):
            sublist2 = []
            for dim3 in range(10):
                sublist2.append(flat_list[index])
                index += 1
            sublist1.append(sublist2)
        arr.append(sublist1)
    
    return arr

#game = 1, 2, or 3
def update_and_delete(arr_3d, new_array, game):
    # Update the first array with the new 2D array
    arr_3d[game].insert(0, new_array)
    # Remove the last array
    arr_3d[game].pop()

        
"""
# Example usage:
original_array = [[[1, 2, 3, 4, 5], [6, 7, 8, 9, 10]], [[11, 12, 13, 14, 15], [16, 17, 18, 19, 20]], [[21, 22, 23, 24, 25], [26, 27, 28, 29, 30]]]

# Convert the array to a string
array_str = array_to_string(original_array)

# Recreate the original array from the string
recreated_array = string_to_array(array_str, shape=(3, 2, 5))

# Check if the original and recreated arrays are the same
print(original_array == recreated_array)
"""

original_3d_array = [
    [[1, 2, 3], [4, 5, 6]],
    [[10, 11, 12], [13, 14, 15]],
    [[19, 20, 21], [22, 23, 24]]
]

# New 2D array to update the first array
new_array = [28, 29, 30]


print("Original 3D Array:")
for i, arr in enumerate(original_3d_array):
    print(f"Array {i + 1}:\n{arr}")

update_and_delete(original_3d_array, new_array, 0)

print("\nUpdated 3D Array:")
for i, arr in enumerate(original_3d_array):
    print(f"Array {i + 1}:\n{arr}")